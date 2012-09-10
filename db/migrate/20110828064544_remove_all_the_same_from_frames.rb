class RemoveAllTheSameFromFrames < ActiveRecord::Migration
  def self.up
    remove_column :frames, :all_the_same
  end

  def self.down
    add_column :frames, :all_the_same, :boolean
  end
end
