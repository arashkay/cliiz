class AddAddableToComponent < ActiveRecord::Migration
  def self.up
    add_column :components, :addable, :boolean
  end

  def self.down
    remove_column :components, :addable
  end
end
