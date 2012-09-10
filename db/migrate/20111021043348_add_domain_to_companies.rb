class AddDomainToCompanies < ActiveRecord::Migration
  def self.up
    add_column :companies, :domain, :string
  end

  def self.down
    remove_column :companies, :domain
  end
end
