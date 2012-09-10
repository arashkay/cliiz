class AddFirstEditDoneToCompanies < ActiveRecord::Migration
  def change
    add_column :companies, :first_edit_done, :bool, :default => false
  end
end
