class CreateUniversalposts < ActiveRecord::Migration
  def change
    create_table :universalposts do |t|

      t.timestamps null: false
    end
  end
end
