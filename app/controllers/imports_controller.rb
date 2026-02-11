# frozen_string_literal: true

class ImportsController < ApplicationController
  def new
  end

  def create
    unless params[:file].respond_to?(:read)
      flash.now[:alert] = "Please choose a CSV file."
      render :new, status: :unprocessable_entity
      return
    end

    result = CsvImportService.call(params[:file])

    if result.errors.any? && result.imported.zero?
      flash.now[:alert] = format_result(result)
      render :new, status: :unprocessable_entity
    else
      flash[:notice] = format_result(result)
      redirect_to import_path
    end
  end

  private

  def format_result(result)
    parts = ["Imported: #{result.imported}"]
    parts << "Skipped: #{result.skipped.size} rows" if result.skipped.any?
    if result.errors.any?
      parts << "Errors: #{result.errors.map { |e| "Line #{e[:line]}: #{e[:message]}" }.join('; ')}"
    end
    parts.join(". ")
  end
end
