# frozen_string_literal: true

module PeopleHelper
  def sortable_header(column, label)
    direction = (sort_column == column && sort_direction == "asc") ? "desc" : "asc"
    url = people_path(q: search_param, sort: column, direction: direction, page: nil)
    text = sort_column == column ? "#{label} #{sort_arrow(column)}" : label
    link_to text, url, class: "people-index__sort-link"
  end

  def sort_arrow(column)
    return "" unless sort_column == column
    sort_direction == "asc" ? " ↑" : " ↓"
  end
end
