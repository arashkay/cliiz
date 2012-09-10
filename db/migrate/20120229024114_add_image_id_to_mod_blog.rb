class AddImageIdToModBlog < ActiveRecord::Migration
  def change
    add_column :mod_blogs, :image_id, :integer
  end
end
