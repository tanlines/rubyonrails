# frozen_string_literal: true

class CreatePeople < ActiveRecord::Migration[7.2]
  def change
    create_table :people do |t|
      t.string :first_name, null: false
      t.string :last_name
      t.string :species, null: false
      t.string :gender, null: false
      t.string :weapon
      t.string :vehicle

      t.timestamps
    end

    # gender: male, female, other (enforced in model; SQLite has no native enum)
    add_check_constraint :people, "gender IN ('male', 'female', 'other')", name: "people_gender_check"
  end
end
