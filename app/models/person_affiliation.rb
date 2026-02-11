# frozen_string_literal: true

class PersonAffiliation < ApplicationRecord
  belongs_to :person
  belongs_to :affiliation

  validates :person_id, uniqueness: { scope: :affiliation_id }
end
