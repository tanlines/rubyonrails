# frozen_string_literal: true

require "csv"

class CsvImportService
  REQUIRED_HEADERS = %w[Name Location Species Gender Affiliations].freeze
  GENDER_MAP = { "m" => "male", "f" => "female", "male" => "male", "female" => "female" }.freeze

  Result = Data.define(:imported, :skipped, :errors)

  def self.call(file)
    new(file).call
  end

  def initialize(file)
    @file = file
    @imported = 0
    @skipped = []
    @errors = []
  end

  def call
    content = @file.read
    sep = content.include?("\t") ? "\t" : ","
    table = CSV.parse(content, headers: true, col_sep: sep, liberal_parsing: true)

    unless (REQUIRED_HEADERS - table.headers.map { |h| h.to_s.strip.titleize }).empty?
      return Result.new(imported: 0, skipped: [], errors: ["CSV must have headers: Name, Location, Species, Gender, Affiliations"])
    end

    table.each.with_index(2) do |row, line_num|
      process_row(normalize_row(row), line_num)
    end

    Result.new(imported: @imported, skipped: @skipped, errors: @errors)
  end

  private

  def normalize_row(row)
    row.to_h.transform_keys { |k| k.to_s.strip.titleize }.transform_values { |v| v.to_s.strip }
  end

  def process_row(row, line_num)
    name = row["Name"].presence
    location_str = row["Location"].presence
    species = row["Species"].presence
    gender = normalize_gender(row["Gender"])
    affil_str = row["Affiliations"].to_s.strip
    weapon = optional_field(row["Weapon"])
    vehicle = optional_field(row["Vehicle"])

    if affil_str.blank? || name.blank? || location_str.blank? || species.blank? || gender.blank?
      @skipped << { line: line_num, reason: "missing required field (Name, Location, Species, Gender, or Affiliations)" }
      return
    end

    first_name, last_name = split_name(name)
    location_ids = location_str.split(",").map { |s| Location.find_or_create_by!(name: s.strip.titleize).id }.uniq
    affiliation_ids = affil_str.split(",").map { |s| Affiliation.find_or_create_by!(name: s.strip.titleize).id }.uniq

    Person.create!(
      first_name: first_name,
      last_name: last_name.presence,
      species: species.titleize,
      gender: gender,
      weapon: weapon,
      vehicle: vehicle,
      location_ids: location_ids,
      affiliation_ids: affiliation_ids
    )
    @imported += 1
  rescue ActiveRecord::RecordInvalid => e
    @errors << { line: line_num, message: e.message }
  end

  def split_name(name)
    parts = name.titleize.split
    return [name.titleize, nil] if parts.size <= 1
    [parts[0..-2].join(" "), parts.last]
  end

  def normalize_gender(val)
    return nil if val.blank?
    key = val.to_s.strip.downcase
    GENDER_MAP[key] || (Person::GENDERS.include?(key) ? key : "other")
  end

  def optional_field(val)
    return nil if val.blank?
    s = val.to_s.strip
    return nil if s.match?(/\A\-?\d+(\.\d+)?\z/)
    s
  end
end
