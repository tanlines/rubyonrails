# frozen_string_literal: true

class CreatePersonLocations < ActiveRecord::Migration[7.2]
  def change
    create_join_table :people, :locations, table_name: :person_locations do |t|
      t.index :person_id
      t.index :location_id
      t.index [:person_id, :location_id], unique: true
    end
  end
end
