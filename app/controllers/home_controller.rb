class Link
  @name
  @url
  @parent #WikiNode
  def initialize(name, url)
     @name = name
     @url = url
  end

  def to_json(*a)
    {
      'json_class' => self.class.name,
      'name' => @name,
      'url' => @url
    }
  end

  def name
    return @name
  end
end

class WikiNode
  @sections
  @links
  @parent #WikiNode, null
  @title
  @level
  def initialize(title,level)
    @title = title
    @sections = Array.new
    @links = Array.new
    @level = level
  end

  def to_json(*a)
    sections_json = Array.new
    @sections.each do |section|
      sections_json << section.to_json
    end
    links_json = Array.new
    @links.each do |link|
      links_json << link.to_json
    end
    {
      'json_class' => self.class.name,
      'title' => @title,
      'sections' => sections_json,
      'links' => links_json
    }
  end

  def addSection(sec)
    @sections << sec
  end
  
  def addLink(link)
    @links << link
  end

  def level
    return @level
  end

  def parentTo(parent)
    @parent = parent
  end

  def parent
    return @parent
  end

  def title
    return @title
  end

  def isParentOf(node)
    return true if @level=="0"
    index = node.level.rindex(".")
    if index==nil
      return false
    end
    return (@level==node.level[0...node.level.rindex(".")])
  end

  def sections
    return @sections
  end

  def to_s
    s = @title+"<br>"
    @links.each do |link|
      s+=link.name + "<br>"
    end
    @sections.each do |section|
      s+="&nbsp;&nbsp;"+section.to_s
    end
    return s
    
  end

end

#structure of a wikinode
#sections: array:WikiNode
#links: array:Link


class HomeController < ApplicationController
  def index
  end

  def doSearch #this is also an AJAX method
    require 'net/http'
    require 'uri'
    @search = params[:page]
    Net::HTTP.start('en.wikipedia.org',80) do |http|
      @xml = (http.get('/w/api.php?action=opensearch&format=json&search='+@search+'&limit=5&namespace=0&suggest&format=xml',"User-Agent" => "Jesse Sharps(MIT, testing random things)").body);
      logger.info(@xml)
    end
    render:xml=>@xml
  end
  def fetch #this is an AJAX method





    require 'xml'
    require 'net/http'
    require 'uri'
    @toParse = params[:page]
    Net::HTTP.start( 'en.wikipedia.org', 80 ) do |http|
      xml=( http.get( '/w/api.php?action=parse&format=xml&page='+URI.escape(@toParse)+'&redirects&prop=text', "User-Agent" => "Jesse Sharps (MIT, testing random things)" ).body ) ; 
      #page level node
      node = WikiNode.new(@toParse,0)
      node.parentTo(node)
      currentNode = node
      sections = Hash.new
      #parse the section that gives section/number info i.e. "1.2.1 Section"
      regex= /tocnumber&quot;&gt;(.*?)&lt;.*?toctext&quot;&gt;(.*?)&lt;/
      xml.scan(regex).each do |match|
        sections[match[1]]=match[0]
      end
      #parse sections and links into nodes
      regex = /span class=&quot;mw-headline&quot; id=&quot.*?&quot;&gt;(?:&lt;.*?&gt;)*(.*?)&lt;|a href=&quot;\/wiki\/([^=]*?)&quot; title=&quot;(.*?)&quot;/
      xml.scan(regex).each do |match|
        if match[0] != nil #this is a section
          if match[0].index("References") == 0
            next
          end
          section = sections[match[0]]
          if not section
            section="1"
          end
          newnode = WikiNode.new(match[0],section)
          if currentNode.isParentOf(newnode)
            newnode.parentTo(currentNode)
            currentNode.addSection(newnode)
          else
            parent = currentNode.parent
            while not parent.isParentOf(newnode)
              if parent.parent==parent
                break #pop up until parent found
              end
              parent = parent.parent
            end
            newnode.parentTo(parent)
            parent.addSection(newnode)
          end
          currentNode = newnode
        else #this is a link
          if match[1].index("Wikipedia:") == 0
            next #ignore meta internal links
          end
          link = Link.new(match[2],match[1])
          currentNode.addLink(link)
        end
      end
    @page = node.to_json.inspect #necessary for some reason
    @page=@page.gsub("=>",":").gsub("'","%27").gsub("\\x","%") #replace shit with shit
    #logger.info @page
    render:json => @page #return
    end

  end
end
