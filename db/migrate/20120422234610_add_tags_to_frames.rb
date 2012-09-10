class AddTagsToFrames < ActiveRecord::Migration
  def change
    add_column :frames, :tags, :string
  end
end
