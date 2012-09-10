class AddFolderIdToImages < ActiveRecord::Migration
  def self.up
    add_column :images, :folder_id, :integer
  end

  def self.down
    remove_column :images, :folder_id
  end
end
