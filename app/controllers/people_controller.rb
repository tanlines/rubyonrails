# frozen_string_literal: true

class PeopleController < ApplicationController
  PER_PAGE = 10
  SORTABLE_COLUMNS = %w[first_name last_name species gender weapon vehicle].freeze

  def index
    @people = Person.all
    @people = apply_search(@people)
    @people = apply_sort(@people)
    @total_count = @people.count
    @people = @people.includes(:locations, :affiliations).limit(PER_PAGE).offset(offset)
  end

  private

  def apply_search(scope)
    q = search_param
    return scope if q.blank?

    pattern = "%#{Person.sanitize_sql_like(q)}%"
    scope.left_joins(:locations, :affiliations).where(
      "people.first_name LIKE :p OR people.last_name LIKE :p OR people.species LIKE :p OR " \
      "people.gender LIKE :p OR people.weapon LIKE :p OR people.vehicle LIKE :p OR " \
      "locations.name LIKE :p OR affiliations.name LIKE :p",
      p: pattern
    ).distinct
  end

  def apply_sort(scope)
    column = sort_column
    direction = sort_direction
    scope.reorder(Person.arel_table[column].send(direction))
  end

  def search_param
    params[:q].to_s.strip.presence
  end

  def sort_column
    col = params[:sort].to_s
    SORTABLE_COLUMNS.include?(col) ? col : "first_name"
  end

  def sort_direction
    %w[asc desc].include?(params[:direction].to_s.downcase) ? params[:direction].downcase : "asc"
  end

  def current_page
    [params[:page].to_i, 1].max
  end

  def offset
    (current_page - 1) * PER_PAGE
  end

  def total_pages
    (@total_count.to_f / PER_PAGE).ceil
  end
  helper_method :current_page, :total_pages, :search_param, :sort_column, :sort_direction
end
