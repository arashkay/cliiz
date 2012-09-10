class AddIsPackageToComponent < ActiveRecord::Migration
  def self.up
    add_column :components, :is_package, :boolean
  end

  def self.down
    remove_column :components, :is_package
  end
end
