class AddTrashedToModBlogs < ActiveRecord::Migration
  def self.up
    add_column :mod_blogs, :trashed, :string, :default => false
  end

  def self.down
    remove_column :mod_blogs, :trashed
  end
end
