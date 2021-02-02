class JSSandbox {

  constructor() {

    this.sampleEnv = {
       "queued":true,
       "code":"$('.my-div').html('Hello World!')",
       "markup":"<div class=\"my-div\"></div>",
       "styles":".my-div {\n\tborder: 4px solid green;\n\tpadding: 20px;\n}"
    }

    $('.sandbox .actions .button.export').click(this.onExport.bind(this));
    $('.sandbox .actions .button.clear').click(this.onClear.bind(this));
    $('.actions .button.run').click(this.onRun.bind(this));
    $('.sandbox .editor textarea').keydown(this.onKeydown);
    $('textarea').on('paste', function(event) { event.stopPropagation(); });
    
    document.body.addEventListener('paste',this.onPaste.bind(this))
    document.body.addEventListener('copy',this.onCopy.bind(this))
    
    this.rendered = false;
    const urlParams = new URLSearchParams(window.location.search);

    let sample = urlParams.get('s');
    
    if(sample) {

      urlParams.delete('s');

      $.get('/sandboxes/' + sample + '.json')
      .done(this.onSample.bind(this));
    
    } else {
      
      //localStorage.removeItem('currentEnv');
      this.saved = localStorage.getItem('currentEnv');
    
      this.env = !this.saved ? this.sampleEnv : JSON.parse(this.saved);
    
      this.load(this.env);  
    } 
  }
  
  load(env) {

    $('.markup textarea').val(env.markup);
    $('.styles textarea').val(env.styles);
    $('.code textarea').val(env.code);

    if(env.queued) {
      this.queued = false;
      this.save(env);
      // let page finish rendering
      setTimeout(this.launch.bind(this, env), 30)
    }
  }

  save(env) {
    localStorage.setItem('currentEnv', JSON.stringify(env));          
  } 

  launch(env) {

    env.code = $('.code textarea').val();
    env.markup = $('.markup textarea').val();
    env.styles = $('.styles textarea').val();
    env.queued = false;
    
    this.save(env);

    this.exec(env);
  }

  exec(env) {
    
    if(!this.rendered) {

      $('.output').empty();
      $('.output').append('<style type="text/css">' + env.styles + '</style>');
      $('.output').append(env.markup);
      $('.output').append('<scri' + 'pt type="text/javascript">' + env.code + '</sc' + 'ript>');  
    } else {
      env.queued = true;
      this.save(env);
      window.location = window.location.href.split("?")[0];;
    }

    this.rendered = true;
  }

  onPaste(event) {
    event.stopPropagation();
    event.preventDefault();
    
    let clipboard = event.clipboardData || window.clipboardData;
    let str = clipboard.getData('Text');
    
    let env = JSON.parse(str);

    this.load(env);
  }

  onCopy(event) {

    event.preventDefault();
    
    this.env.code = $('.code textarea').val();
    this.env.markup = $('.markup textarea').val();
    this.env.styles = $('.styles textarea').val();
    this.queued = false; 
    let sandbox = JSON.stringify(this.env);
    console.log(sandbox)

    if(event.clipboardData) {
      event.clipboardData.setData('text/plain', sandbox);
    } else if (window.clipboardData) {
      window.clipboardData.setData('Text', sandbox);
    }
  }


  onSample(data) {
    this.env = data;
    this.load(this.env)
  }

  onExport(event) {
    event.stopPropagation();
    event.preventDefault();

    document.execCommand('copy');
  } 

  onClear(event) {
    event.stopPropagation();
    event.preventDefault();

    $('.code textarea').val('');
    $('.markup textarea').val('');
    $('.styles textarea').val('');  
  }

  onRun(event) {
    event.stopPropagation();
    event.preventDefault();

    this.launch(this.env)
  }

  onKeydown(event) {
    
    // did u pressed tab ?
    if(event.which == 9) {
      event.preventDefault();
      
      let start = this.selectionStart;
      let end = this.selectionEnd;

      this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

      this.selectionStart = this.selectionEnd = start + 1;
    }
  }
}
