class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|

     t.string :username, null: false
		t.string :email, null: false, index: true, unique: true
      t.string :password
      t.text :deviceId, null: false
	   t.string :deviceType, null: false
	   t.string :otp, null: false, default: ''
      t.timestamps
    end
  end
end

