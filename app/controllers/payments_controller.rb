class PaymentsController < ApplicationController
  

  before_filter :authenticate_company!

  def index
    @payments = Payment.all
  end

end
