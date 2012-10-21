class CreateModLists < ActiveRecord::Migration
  def change
    create_table :mod_lists do |t|
      t.integer :used_component_id
      t.string :name
      t.string :summary
      t.decimal :price, :precision => 8, :scale => 2
      t.text :description
      t.boolean :commentable
      t.integer :image_id
      t.integer :view_count, :default => 0

      t.timestamps
    end
  end
end
