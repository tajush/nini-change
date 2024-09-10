

$(document).ready(function() {
    $('.selected-option').click(function(e) {
        e.stopPropagation();
        $('.options').toggle();
    });

    $('.options li').click(function() {
        var value = $(this).attr('value');
        var text = $(this).text();
        $('.selected-option').text(text);
        $('.selected-option').attr('value', value);
        $('.options li').removeClass('selected');
        $(this).addClass('selected');
        // Perform any other action needed when an option is selected
        // For example, you can submit a form with the selected value
    });

    $(document).click(function() {
        $('.options').hide();
    });
});
