# frozen_string_literal: true

class PersonLocation < ApplicationRecord
  belongs_to :person
  belongs_to :location

  validates :person_id, uniqueness: { scope: :location_id }
end
