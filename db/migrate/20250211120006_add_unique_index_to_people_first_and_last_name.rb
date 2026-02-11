# frozen_string_literal: true

class AddUniqueIndexToPeopleFirstAndLastName < ActiveRecord::Migration[7.2]
  def change
    add_index :people, [:first_name, :last_name], unique: true, name: "index_people_on_first_name_and_last_name"
  end
end
