{% extends "./master" %}

{% block body %}
    {% if invalid %}
        <div class="row">
            <div class="twelve columns">
                <div class="alert alert-box">
                    The url you submitted (<a href="{{ url }}">{{ url }}</a>) is not valid. Please try again.
                </div>
            </div>
        </div>
    {% endif %}

    <div class="row">
        <div class="twelve columns">
            <form action="/submit" method="post">
                <label for="url">A link to an imgur gif&hellip;</label>
                <div class="row collapse">
                    <div class="one columns">
                        <span class="prefix">
                            <span class="foundicon-photo"></span>
                        </span>
                    </div>
                    <div class="nine columns">
                        <input type="text" placeholder="imgur link&hellip;" name="url" id="url" />
                    </div>
                    <div class="two columns">
                        <input type="submit" class="button postfix expand" value="Share" />
                    </div>
                </div>
            </form>
        </div>
    </div>
{% endblock %}
