require 'csv'
require 'json'
require 'active_support/all'

# How to:
# ruby csv-to-json.rb /path/to/file.csv

path = ARGV[0]
entries = CSV.read(path, { headers: true, converters: :numeric, header_converters: :symbol })

data = {}

entries.each do |entry|
  next if entry[:home_url].blank?
  next if entry[:affiliate_link].blank?
  next if entry[:enabled] == "N"

  affiliate_link = entry[:affiliate_link].gsub("\"", '').split[0]
  home_url       = entry[:home_url]

  data[home_url] = affiliate_link
end

File.open("affiliates.json", "w") do |file|
  file.write(JSON.pretty_generate(data))
end

