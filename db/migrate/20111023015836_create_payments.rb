class CreatePayments < ActiveRecord::Migration
  def self.up
    create_table :payments do |t|
      t.integer :company_id
      t.text :transaction_info

      t.timestamps
    end
  end

  def self.down
    drop_table :payments
  end
end
