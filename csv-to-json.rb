require 'csv'
require 'json'
require 'active_support/all'
require 'uri'

# How to:
# ruby csv-to-json.rb /path/to/file.csv

def prepare_affiliate_link(url)
  uri_parsed     = URI.parse(url.gsub("\"", '').split[0].sub(/^https?\:\/\//, ''))
  query_strings  = (uri_parsed.query || '').split("&")
  query_strings  << "g4g=true"

  uri_parsed.query = query_strings.join("&")

  uri_parsed.to_s
end

path = ARGV[0]
entries = CSV.read(path, { headers: true, converters: :numeric, header_converters: :symbol })

data = {}

entries.each do |entry|
  next if entry[:home_url].blank?
  next if entry[:affiliate_link].blank?
  next if entry[:enabled] == "N"

  affiliate_link = prepare_affiliate_link(entry[:affiliate_link])
  home_url       = entry[:home_url].sub(/^www./,'').sub(/^https?\:\/\//, '')

  base_url = "http://g4gdata.com/gift4good/test.php?link={url}&cause={cause}&UniqueId={uniqueId}&memberID={memberId}"

  data[home_url] = base_url.sub("{url}", URI.escape(affiliate_link))
end

File.open("src/common/res/affiliates.json", "w") do |file|
  file.write(JSON.pretty_generate(data))
end

