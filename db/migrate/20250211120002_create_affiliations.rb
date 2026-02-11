# frozen_string_literal: true

class CreateAffiliations < ActiveRecord::Migration[7.2]
  def change
    create_table :affiliations do |t|
      t.string :name, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
