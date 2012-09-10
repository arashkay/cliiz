class CreateModGalleries < ActiveRecord::Migration
  def self.up
    create_table :mod_galleries do |t|
      t.integer :used_component_id
      t.string :title
      t.integer :image_id
      t.string :category

      t.timestamps
    end
  end

  def self.down
    drop_table :mod_galleries
  end
end
