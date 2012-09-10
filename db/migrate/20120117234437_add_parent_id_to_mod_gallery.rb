class AddParentIdToModGallery < ActiveRecord::Migration
  def self.up
    remove_column :mod_galleries, :category
    add_column :mod_galleries, :parent_id, :integer
    add_column :mod_galleries, :is_album, :bool, :default => false
  end

  def self.down
    add_column :mod_galleries, :category, :string
    remove_column :mod_galleries, :parent_id
    remove_column :mod_galleries, :is_album
  end
end
