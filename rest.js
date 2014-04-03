/**
 * Patterns rest - Interact with restful apis
 *
 * Copyright 2012-2013 Florian Friesdorf
 * Copyright 2012-2013 Marko Durkovic
 */
define([
    "jquery",
    "pat-registry",
    "pat-logger",
    "pat-parser",
    "star-ajax"
], function($, registry, logger, Parser, ajax) {
    var log = logger.getLogger('pat.rest'),
        parser = new Parser('rest');

    parser.add_argument("keep-empty");

    var _ = {
        name: "rest",
        trigger: "form.pat-rest",
        parser: parser,
        init: function($el) {
            options = parser.parse($el);
            $el.data("patRest", options['keepEmpty']);
            $el.on('submit.pat-rest', _.onSubmit)
               .on('click.pat-ajax', '[type=submit]', _.onClickSubmit);
            return $el;
        },
        destroy: function($el) {
            $el.off('.pat-rest');
        },
        onSubmit: function(event) {
            if (event) {
                event.preventDefault();
            }
            _.request($(this));
        },
        onClickSubmit: function(event) {
            var $form = $(event.target).parents('form').first(),
                name = event.target.name,
                value = $(event.target).val(),
                data = [];
            if (name) {
                data.push({name: name, value: value});
            }
            $form.data('pat-rest.clicked-data', data);
        },
        request: function($el, opts) {
            return $el.each(function() {
                _._request($(this), opts);
            });
        },
        _serializeObject: function($el) {
            var ret = {}, keepEmpty = $el.data('patRest');
            $.each($el.serializeArray()
                      .concat($el.data('pat-rest.clicked-data') || []),
                     function() {
                if (this.value === '' && !keepEmpty) {
                    return;
                }
                if ($('[name="'+this.name+'"]')
                    .parents('.hidden,.disabled').length > 0) {
                    return;
                }

                if (ret[this.name]) {
                    if (!ret[this.name].push) {
                        ret[this.name] = [ret[this.name]];
                    }
                    ret[this.name].push(this.value || '');
                } else {
                    ret[this.name] = this.value || '';
                }
            });
            return ret;
        },
        _request: function($el, opts) {
            var args = {
                contentType: 'application/json',
                context: $el,
                data: JSON.stringify(_._serializeObject($el)),
                dataType: 'json',
                type: $el.attr('method'),
                url: $el.attr('action')
            };
            ajax.request(args);
        }
    };

    registry.register(_);
    return _;
});
