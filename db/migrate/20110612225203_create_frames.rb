class CreateFrames < ActiveRecord::Migration
  def self.up
    create_table :frames do |t|
      t.string :name
      t.text :default
      t.text :home
      t.text :about
      t.text :contact
      t.boolean :all_the_same

      t.timestamps
    end
  end

  def self.down
    drop_table :frames
  end
end
