# frozen_string_literal: true

class Person < ApplicationRecord
  GENDERS = %w[male female other].freeze

  has_many :person_locations, dependent: :destroy
  has_many :locations, through: :person_locations
  has_many :person_affiliations, dependent: :destroy
  has_many :affiliations, through: :person_affiliations

  validates :first_name, presence: true
  validates :species, presence: true
  validates :gender, presence: true, inclusion: { in: GENDERS }
  validates :locations, length: { minimum: 1, message: "must have at least one" }
  validates :affiliations, length: { minimum: 1, message: "must have at least one" }
  # last_name, weapon, vehicle are optional
end
