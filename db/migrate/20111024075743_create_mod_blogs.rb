class CreateModBlogs < ActiveRecord::Migration
  def self.up
    create_table :mod_blogs do |t|
      t.integer :used_component_id
      t.string :title
      t.text :content
      t.datetime :publish_date
      t.boolean :commentable

      t.timestamps
    end
  end

  def self.down
    drop_table :mod_blogs
  end
end
