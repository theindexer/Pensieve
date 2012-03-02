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
  def fetch
    require 'xml'
    require 'net/http'
    @toParse = params[:page]
    logger.info @toParse
    Net::HTTP.start( 'en.wikipedia.org', 80 ) do |http|
      xml=( http.get( '/w/api.php?action=parse&format=xml&page='+@toParse+'&redirects&prop=text', "User-Agent" => "Jesse Sharps (MIT, testing random things)" ).body ) ; 

      node = WikiNode.new(@toParse,0)
      node.parentTo(node)
      currentNode = node
      sections = Hash.new
      regex= /tocnumber&quot;&gt;(.*?)&lt;.*?toctext&quot;&gt;(.*?)&lt;/
      xml.scan(regex).each do |match|
        sections[match[1]]=match[0]
      end
      regex = /span class=&quot;mw-headline&quot; id=&quot.*?&quot;&gt;(.*?)&lt;|a href=&quot;\/wiki\/([^=]*?)&quot; title=&quot;(.*?)&quot;/
      xml.scan(regex).each do |match|
        if match[0] != nil
          if match[0].index("References") == 0
            next
          end
          newnode = WikiNode.new(match[0],sections[match[0]])
          if currentNode.isParentOf(newnode)
            newnode.parentTo(currentNode)
            currentNode.addSection(newnode)
          else
            parent = currentNode.parent
            while not parent.isParentOf(newnode)
              if parent.parent==parent
                break
              end
              parent = parent.parent
            end
            newnode.parentTo(parent)
            parent.addSection(newnode)
          end
          currentNode = newnode
        else
          if match[1].index("Wikipedia:") == 0
            next
          end
          link = Link.new(match[2],match[1])
          currentNode.addLink(link)
        end
      end
    @page = node.to_json.inspect
    @page=@page.gsub("=>",":").gsub("'","\\\\'")
    render:json => @page
    #puts posts
    end

  end
end