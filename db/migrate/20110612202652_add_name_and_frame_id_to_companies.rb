class AddNameAndFrameIdToCompanies < ActiveRecord::Migration
  def self.up
    add_column :companies, :name, :string
    add_column :companies, :frame_id, :integer
  end

  def self.down
    remove_column :companies, :frame_id
    remove_column :companies, :name
  end
end
