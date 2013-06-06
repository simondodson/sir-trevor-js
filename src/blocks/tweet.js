var tweet_template = [
  "<blockquote class='twitter-tweet' align='center'>",
  "<p><%= text %></p>",
  "&mdash; <%= user.name %> (@<%= user.screen_name %>)",
  "<a href='<%= status_url %>' data-datetime='<%= created_at %>'><%= created_at %></a>",
  "</blockquote>",
  '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
].join("\n");

SirTrevor.Blocks.Tweet = SirTrevor.Block.extend({

  type: "Tweet",
  droppable: true,
  drop_options: {
    pastable: true,
    re_render_on_reorder: true
  },

  icon_name: function() {
    return 'twitter';
  },

  loadData: function(data) {
    this.$inner.find('iframe').remove();
    this.$inner.prepend(_.template(tweet_template, data));
  },

  onContentPasted: function(event){
    // Content pasted. Delegate to the drop parse method
    var input = $(event.target),
        val = input.val();

    // Pass this to the same handler as onDrop
    this.handleTwitterDropPaste(val);
  },

  handleTwitterDropPaste: function(url){

    if(_.isURI(url))
    {
      if (url.indexOf("twitter") != -1 && url.indexOf("status") != -1) {
        // Twitter status
        var tweetID = url.match(/[^\/]+$/);
        if (!_.isEmpty(tweetID)) {

          this.loading();

          tweetID = tweetID[0];

          var tweetCallbackSuccess = function(data) {
            // Parse the twitter object into something a bit slimmer..
            var obj = {
              user: {
                profile_image_url: data.user.profile_image_url,
                profile_image_url_https: data.user.profile_image_url_https,
                screen_name: data.user.screen_name,
                name: data.user.name
              },
              text: data.text,
              created_at: data.created_at,
              status_url: url
            };

            // Save this data on the block
            this.setData(obj);
            this._loadData();

            this.ready();
          };

          var tweetCallbackFail = function(){
            this.ready();
          };

          // Make our AJAX call
          $.ajax({
            url: "http://api.twitter.com/1/statuses/show/" + tweetID + ".json",
            dataType: "JSONP",
            success: _.bind(tweetCallbackSuccess, this),
            error: _.bind(tweetCallbackFail, this)
          });
        }
      }
    }

  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleTwitterDropPaste(url);
  }
});
