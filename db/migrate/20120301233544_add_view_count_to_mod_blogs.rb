class AddViewCountToModBlogs < ActiveRecord::Migration
  def change
    add_column :mod_blogs, :view_count, :integer, :default => 0
  end
end
