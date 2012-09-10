class CreateUsedComponents < ActiveRecord::Migration
  def self.up
    create_table :used_components do |t|
      t.integer :company_id
      t.integer :component_id
      t.string :page
      t.integer :partition
      t.integer :ordering
      t.text :setting
      t.string :uid

      t.timestamps
    end
  end

  def self.down
    drop_table :used_components
  end
end
