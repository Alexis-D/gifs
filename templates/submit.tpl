{% if invalid %}
    invalid url
{% endif %}

<form action="/submit" method="post">
    <input type="text" placeholder="imgur link&hellip;" name="url"/>
    <input type="submit" />
</form>
