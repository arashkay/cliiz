class Payment < ActiveRecord::Base
  serialize :transaction_info
end
