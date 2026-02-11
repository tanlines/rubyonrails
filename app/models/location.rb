# frozen_string_literal: true

class Location < ApplicationRecord
  has_many :person_locations, dependent: :destroy
  has_many :people, through: :person_locations

  validates :name, presence: true, uniqueness: true
end
