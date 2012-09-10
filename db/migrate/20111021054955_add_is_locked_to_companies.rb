class AddIsLockedToCompanies < ActiveRecord::Migration
  def self.up
    add_column :companies, :is_locked, :bool, :default => false
  end

  def self.down
    remove_column :companies, :is_locked
  end
end
