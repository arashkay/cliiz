class AddOrderToFrames < ActiveRecord::Migration
  def change
    add_column :frames, :order, :integer, :default => 0
  end
end
