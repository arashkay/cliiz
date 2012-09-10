class AddDisabledToUsedComponent < ActiveRecord::Migration
  def self.up
    add_column :used_components, :disabled, :bool
  end

  def self.down
    remove_column :used_components, :disabled
  end
end
