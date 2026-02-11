# frozen_string_literal: true

module Api
  class ImportsController < BaseController
    def create
      unless params[:file].respond_to?(:read)
        render json: { error: "Please choose a CSV file." }, status: :unprocessable_entity
        return
      end

      result = CsvImportService.call(params[:file])

      status =
        if result.errors.any? && result.imported.zero?
          :unprocessable_entity
        else
          :ok
        end

      render json: {
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors
      }, status: status
    end
  end
end

