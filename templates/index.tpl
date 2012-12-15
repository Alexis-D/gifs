<img src="{{ url }}" />

{# check if already voted #}

<form action="/vote" method="post">
    <input type="hidden" name="vote" value="up" />
    <input type="hidden" name="id" value="{{ id }}" />
    <input type="submit" value="Yay!" />
</form>

<form action="/vote" method="post">
    <input type="hidden" name="vote" value="down" />
    <input type="hidden" name="id" value="{{ id }}" />
    <input type="submit" value="Nay!" />
</form>
