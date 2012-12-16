<div class="row">
    <div class="twelve columns" id="gif" style="display: table;">
        <a href="/gif/{{ id }}" class="th"><img src="{{ url }}" /></a>
    </div>
</div>

{# check if already voted #}

<div class="row">
    <div class="two columns offset-by-four">
        <form action="/vote" method="post" class="vote">
            <input type="hidden" name="vote" value="down" />
            <input type="hidden" name="id" value="{{ id }}" />
            </span><input type="submit" value="Nay!" class="large alert button thumb"/>
        </form>
    </div>

    <div class="two columns end">
        <form action="/vote" method="post" class="vote">
            <input type="hidden" name="vote" value="up" />
            <input type="hidden" name="id" value="{{ id }}" />
            <input type="submit" value="Yay!" class="large success button" />
        </form>
    </div>
</div>
