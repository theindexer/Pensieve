class Pagerank < ActiveRecord::Base

  def self.get_stuff
    connection_hash = configurations["triplet"]
    establish_connection connection_hash
    con = connection()
    page, views, rank =
      con.execute("select page, views, rank from pageviews limit 1").fetch_row;
    remove_connection
    establish_connection configurations[RAILS_ENV]
    logger.info page
    logger.info views
    logger.info rank
    return page
  end
end
