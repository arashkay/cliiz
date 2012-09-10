class AddSettingToCompanies < ActiveRecord::Migration
  def self.up
    add_column :companies, :setting, :text
  end

  def self.down
    remove_column :companies, :setting
  end
end
