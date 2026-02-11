# frozen_string_literal: true

module Api
  class PeopleController < BaseController
    DEFAULT_PER_PAGE = 10
    MAX_PER_PAGE = 100
    SORTABLE_COLUMNS = %w[first_name last_name species gender weapon vehicle].freeze

    def index
      scope = Person.all
      scope = apply_search(scope)
      scope = apply_sort(scope)

      total_count = scope.count
      people = scope.includes(:locations, :affiliations).limit(per_page).offset(offset)

      render json: {
        people: serialize_people(people),
        total_count: total_count,
        page: current_page,
        per_page: per_page,
        total_pages: total_pages(total_count)
      }
    end

    private

    def serialize_people(people)
      people.as_json(
        only: %i[id first_name last_name species gender weapon vehicle],
        include: {
          locations: { only: %i[name] },
          affiliations: { only: %i[name] }
        }
      )
    end

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

    def per_page
      requested = params[:per_page].to_i
      return DEFAULT_PER_PAGE if requested <= 0

      [requested, MAX_PER_PAGE].min
    end

    def offset
      (current_page - 1) * per_page
    end

    def total_pages(total_count)
      (total_count.to_f / per_page).ceil
    end
  end
end

