class AddIsPrivateToFrame < ActiveRecord::Migration
  def self.up
    add_column :frames, :is_private, :boolean, :default => false
  end

  def self.down
    remove_column :frames, :is_private
  end
end
