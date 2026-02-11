# frozen_string_literal: true

class CreatePersonAffiliations < ActiveRecord::Migration[7.2]
  def change
    create_join_table :people, :affiliations, table_name: :person_affiliations do |t|
      t.index :person_id
      t.index :affiliation_id
      t.index [:person_id, :affiliation_id], unique: true
    end
  end
end
